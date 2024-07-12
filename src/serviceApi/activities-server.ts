import { api } from "./api"

type Activity = {
  id: string
  occurs_at: string
  title: string
}

type ActivityCreate = Omit<Activity, "id"> & {
  tripId: string
}

type ActivityResponse = {
  activities: {
    date: string
    activities: Activity[]
  }[]
}

const create = async({ tripId, occurs_at, title }: ActivityCreate) =>{
  try {
    const { data } = await api.post<{ activityId: string }>(
      `/trips/${tripId}/activities`,
      { occurs_at, title }
    )

    return data
  } catch (error) {
    throw error
  }
}

const getActivitiesByTripId = async(tripId: string)=> {
  try {
    const { data } = await api.get<ActivityResponse>(
      `/trips/${tripId}/activities`
    )
    return data.activities
  } catch (error) {
    throw error
  }
}

export const activitiesServer = { create, getActivitiesByTripId }