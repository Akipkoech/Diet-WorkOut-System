export interface ProgressTrackingData {
  id?: string | number;
  userId: number; // Changed from `string | number` to `number`
  date: string;
  weight?: number | null;
  bodyFatPercentage?: number | null;
  chest?: number | null;
  waist?: number | null;
  hips?: number | null;
  arms?: number | null;
  thighs?: number | null;
  notes?: string | null;
}

export const fetchProgressTracking = async (userId: string): Promise<ProgressTrackingData[]> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const token = localStorage.getItem("token");

    // Convert userId to a number before making the request
    const numericUserId = parseInt(userId);
    if (isNaN(numericUserId)) {
      throw new Error("Invalid userId: must be a valid number");
    }

    const response = await fetch(`${API_URL}/api/progress/user/${numericUserId}?limit=30`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch progress tracking data: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in fetchProgressTracking:", error);
    throw error;
  }
};

export const createProgressRecord = async (progressData: ProgressTrackingData): Promise<ProgressTrackingData> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const token = localStorage.getItem("token");

    // Ensure userId is a number
    const numericUserId = Number(progressData.userId);
    if (isNaN(numericUserId)) {
      throw new Error("Invalid userId: must be a valid number");
    }

    const response = await fetch(`${API_URL}/api/progress`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...progressData, userId: numericUserId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to create progress record: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in createProgressRecord:", error);
    throw error;
  }
};

export const updateProgressRecord = async (
  id: string | number,
  progressData: ProgressTrackingData
): Promise<ProgressTrackingData> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const token = localStorage.getItem("token");

    // Ensure userId is a number
    const numericUserId = Number(progressData.userId);
    if (isNaN(numericUserId)) {
      throw new Error("Invalid userId: must be a valid number");
    }

    const response = await fetch(`${API_URL}/api/progress/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...progressData, userId: numericUserId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to update progress record: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in updateProgressRecord:", error);
    throw error;
  }
};

export const deleteProgressRecord = async (id: string | number): Promise<void> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/api/progress/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to delete progress record: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error("Error in deleteProgressRecord:", error);
    throw error;
  }
};

export const transformProgressData = (data: ProgressTrackingData[]) => {
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const weightData = sortedData.map((item) => ({
    date: item.date,
    weight: item.weight || 0,
  }));

  const measurementsData = sortedData.map((item) => ({
    date: item.date,
    chest: item.chest || 0,
    waist: item.waist || 0,
    arms: item.arms || 0,
  }));

  const totalWeightChange =
    sortedData.length >= 2
      ? (sortedData[0].weight || 0) - (sortedData[sortedData.length - 1].weight || 0)
      : 0;

  const monthlyWeightChange =
    sortedData.length >= 2
      ? sortedData.slice(-2).reduce((prev, curr) => prev - (curr.weight || 0), sortedData.slice(-2)[0].weight || 0)
      : 0;

  return {
    weightData,
    measurementsData,
    summary: {
      totalWeightChange,
      monthlyWeightChange,
      currentWeight: sortedData.length > 0 ? sortedData[sortedData.length - 1].weight || 0 : 0,
      bodyFatPercentage:
        sortedData.length > 0 ? sortedData[sortedData.length - 1].bodyFatPercentage || 0 : 0,
    },
  };
};