import { useState, useEffect } from "react"
import { Alert, Keyboard, Text, View, SectionList } from "react-native";
import {
  Tag,
  Clock,
  PlusIcon,
  Calendar as IconCalendar,
} from "lucide-react-native";
import dayjs from "dayjs";

import { colors } from "@/styles/colors";

import { activitiesServer } from "@/serviceApi/activities-server";

import { TripData } from "./[id]";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Input } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Calendar } from "@/components/Calendar";
import { Activity, ActivityProps } from "@/components/Activity";

type Props = {
  tripDetails: TripData
}

enum MODAL {
  NONE = 0,
  CALENDAR = 1,
  NEW_ACTIVITY = 2,
}

type TripActivities = {
  title: {
    dayNumber: number
    dayName: string
  }
  data: ActivityProps[]
}

const Activities = ({ tripDetails }: Props) =>{
  // MODAL
  const [showModal, setShowModal] = useState(MODAL.NONE)

  // LOADING
  const [isCreatingActivity, setIsCreatingActivity] = useState(false)
  const [isLoadingActivities, setIsLoadingActivities] = useState(true)

  // DATA
  const [activityTitle, setActivityTitle] = useState("")
  const [activityDate, setActivityDate] = useState("")
  const [activityHour, setActivityHour] = useState("")

  // LISTS
  const [tripActivities, setTripActivities] = useState<TripActivities[]>([])

  const resetNewActivityFields = ()=> {
    setActivityDate("")
    setActivityTitle("")
    setActivityHour("")
    setShowModal(MODAL.NONE)
  }

  const handleCreateTripActivity = async()=> {
    try {
      if (!activityTitle || !activityDate || !activityHour) {
        return Alert.alert("Register activity", "Fill out all fields!")
      }

      setIsCreatingActivity(true)

      await activitiesServer.create({
        tripId: tripDetails.id,
        occurs_at: dayjs(activityDate)
          .add(Number(activityHour), "h")
          .toString(),
        title: activityTitle,
      })

      Alert.alert("New Activity", "New activity registered successfully!")

      await getTripActivities()
      resetNewActivityFields()
    } catch (error) {
      console.log(error)
    } finally {
      setIsCreatingActivity(false)
    }
  }

  const getTripActivities = async()=> {
    try {
      const activities = await activitiesServer.getActivitiesByTripId(
        tripDetails.id
      )

      const activitiesToSectionList = activities.map((dayActivity) => ({
        title: {
          dayNumber: dayjs(dayActivity.date).date(),
          dayName: dayjs(dayActivity.date).format("dddd").replace("-feira", ""),
        },
        data: dayActivity.activities.map((activity) => ({
          id: activity.id,
          title: activity.title,
          hour: dayjs(activity.occurs_at).format("hh[:]mm[h]"),
          isBefore: dayjs(activity.occurs_at).isBefore(dayjs()),
        })),
      }))

      setTripActivities(activitiesToSectionList)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoadingActivities(false)
    }
  }

  useEffect(() => {
    getTripActivities()
  }, [])

  return (
    <View className="flex-1">
      <View className="w-full flex-row mt-5 mb-6 items-center">
        <Text className="text-zinc-50 text-2xl font-semibold flex-1">
          Activities
        </Text>

        <Button onPress={() => setShowModal(MODAL.NEW_ACTIVITY)}>
          <PlusIcon color={colors.lime[950]} />
          <Button.Title>New activity</Button.Title>
        </Button>
      </View>

      {isLoadingActivities ? (
        <Loading />
      ) : (
        <SectionList
          sections={tripActivities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Activity data={item} />}
          renderSectionHeader={({ section }) => (
            <View className="w-full">
              <Text className="text-zinc-50 text-2xl font-semibold py-2">
                Day {section.title.dayNumber + " "}
                <Text className="text-zinc-500 text-base font-regular capitalize">
                  {section.title.dayName}
                </Text>
              </Text>

              {section.data.length === 0 && (
                <Text className="text-zinc-500 font-regular text-sm mb-8">
                  There is not activity registered yet.
                </Text>
              )}
            </View>
          )}
          contentContainerClassName="gap-3 pb-48"
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={showModal === MODAL.NEW_ACTIVITY}
        title="Register activity"
        subtitle="All the guests can view the activities."
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="mt-4 mb-3">
          <Input variant="secondary">
            <Tag color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="Each activity ?"
              onChangeText={setActivityTitle}
              value={activityTitle}
            />
          </Input>

          <View className="w-full mt-2 flex-row gap-2">
            <Input variant="secondary" className="flex-1">
              <IconCalendar color={colors.zinc[400]} size={20} />
              <Input.Field
                placeholder="Date"
                onChangeText={setActivityTitle}
                value={
                  activityDate ? dayjs(activityDate).format("DD [of] MMMM") : ""
                }
                onFocus={() => Keyboard.dismiss()}
                showSoftInputOnFocus={false}
                onPressIn={() => setShowModal(MODAL.CALENDAR)}
              />
            </Input>

            <Input variant="secondary" className="flex-1">
              <Clock color={colors.zinc[400]} size={20} />
              <Input.Field
                placeholder="Time ?"
                onChangeText={(text) =>
                  setActivityHour(text.replace(".", "").replace(",", ""))
                }
                value={activityHour}
                keyboardType="numeric"
                maxLength={2}
              />
            </Input>
          </View>
        </View>

        <Button
          onPress={handleCreateTripActivity}
          isLoading={isCreatingActivity}
        >
          <Button.Title>Save activity</Button.Title>
        </Button>
      </Modal>

      <Modal
        title="Select date"
        subtitle="Select the activity date"
        visible={showModal === MODAL.CALENDAR}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="gap-4 mt-4">
          <Calendar
            onDayPress={(day) => setActivityDate(day.dateString)}
            markedDates={{ [activityDate]: { selected: true } }}
            initialDate={tripDetails.starts_at?.toString()}
            minDate={tripDetails.starts_at?.toString()}
            maxDate={tripDetails.ends_at?.toString()}
          />

          <Button onPress={() => setShowModal(MODAL.NEW_ACTIVITY)}>
            <Button.Title>Confirm</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  )
}

export { Activities}