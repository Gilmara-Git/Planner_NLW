import { useState, useEffect } from "react";
import { View, Image, Text, Keyboard, Alert } from "react-native";
import {
  MapPin,
  Calendar as IconCalendar,
  Settings2,
  UserRoundPlus,
  ArrowRight,
  AtSign,
} from "lucide-react-native";
import { DateData } from "react-native-calendars";
import dayjs from "dayjs";

import { colors } from "@/styles/colors";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Calendar } from "@/components/Calendar";
import { GuestEmail } from "@/components/Email";
import { Loading } from "@/components/Loading";

import { DatesSelected, calendarUtils } from "@/utils/calendarUtils";
import { validateInput } from "@/utils/validateInput";
import { tripStorage } from "@/storage/trip";
import { router } from "expo-router";
import { tripServer } from "@/serviceApi/trip-server";

enum StepForm {
  TRIP_DETAILS = 1,
  ADD_EMAIL = 2,
}

enum MODAL_CONTROL {
  NONE = 0,
  CALENDAR = 1,
  GUESTS = 2,
}

export const Index = () => {
  const [stepForm, setStepForm] = useState(StepForm.TRIP_DETAILS);
  const [showModal, setShowModal] = useState(MODAL_CONTROL.NONE);
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected);
  const [destination, setDestination] = useState("");
  const [emailToInvite, setEmailToInvite] = useState("");
  const [emailsToInvite, setEmailsToInvite] = useState<string[]>([]);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [isGettingTrip, setIsGettingTrip] = useState(true);

  const createTrip = async () => {
    try {
      setIsCreatingTrip(true);

      const newTrip = await tripServer.createTrip({
        destination,
        starts_at: dayjs(selectedDates.startsAt?.dateString).toString(),
        ends_at: dayjs(selectedDates.endsAt?.dateString).toString(),
        emails_to_invite: emailsToInvite,
      });

      Alert.alert("New upcoming Trip", "Your trip was saved successfully!", [
        {
          text: "OK. Continue.",
          onPress: () => saveTrip(newTrip.tripId),
        },
      ]);
    } catch (error) {
      console.log(error);
      setIsCreatingTrip(false);
    }
  };

  const saveTrip = async (tripId: string) => {
    try {
      await tripStorage.saveTripIdOnStorage(tripId);
      router.navigate("/trip/" + tripId);
    } catch (error) {
      Alert.alert(
        "Save trip failed",
        "It was no possible to save the trip ID on your device."
      );
      console.log(error);
    }
  };

  const handleAddEmail = () => {
    if (!validateInput.email(emailToInvite)) {
      return Alert.alert("Guest", "E-mail invalid!");
    }
    const emailAlreadyExists = emailsToInvite.find(
      (email) => email === emailToInvite
    );

    if (emailAlreadyExists) {
      return Alert.alert("Guest", "E-mail already added!");
    }

    setEmailsToInvite((prevState) => [...prevState, emailToInvite]);
    setEmailToInvite("");
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmailsToInvite((prevState) =>
      prevState.filter((email) => email !== emailToRemove)
    );
  };

  const handleSelectDate = (selectedDay: DateData) => {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: selectedDates.startsAt,
      endsAt: selectedDates.endsAt,
      selectedDay,
    });

    setSelectedDates(dates);
  };

  const handleNextStepForm = () => {
    if (
      destination.trim().length === 0 ||
      !selectedDates.startsAt ||
      !selectedDates.endsAt
    ) {
      return Alert.alert(
        "Trip Details",
        "To proceed, add all information required for your trip."
      );
    }

    if (destination.length < 4) {
      return Alert.alert(
        "Trip Details",
        "The destination needs to be at least 4 characters."
      );
    }

    if (stepForm === StepForm.TRIP_DETAILS) {
      return setStepForm(StepForm.ADD_EMAIL);
    }

    Alert.alert("New trip", "Confirm trip?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: createTrip,
      },
    ]);
  };

  const getTripIdAndLoadTrip = async () => {
    try {
      const tripId = await tripStorage.getTripIdOnStorage();

      if (!tripId) {
        return setIsGettingTrip(false);
      }

      const trip = await tripServer.getById(tripId);

      if (trip) {
        return router.navigate("/trip/" + trip.id);
      }
    } catch (error) {
      setIsGettingTrip(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getTripIdAndLoadTrip();
  }, []);

  if (isGettingTrip) {
    return <Loading />;
  }
  return (
    <View className="flex-1 items-center justify-center px-5">
      <Image
        source={require("@/assets/logo.png")}
        className="h-8"
        resizeMode="contain"
      />

      <Image source={require("@/assets/bg.png")} className="absolute" />

      <Text className="text-zinc-400 font-regular text-center text-lg mt-3">
        Invite your friends and plan {"\n"} your next trip.
      </Text>

      <View className="p-4 bg-zinc-900 rounded-xl my-8 w-full border border-zinc-800">
        <Input>
          <MapPin size={20} color={colors.zinc[400]} />
          <Input.Field
            value={destination}
            onChangeText={setDestination}
            editable={stepForm === StepForm.TRIP_DETAILS}
            placeholder="Where are  you going to ?"
          />
        </Input>

        <Input>
          <IconCalendar size={20} color={colors.zinc[400]} />
          <Input.Field
            value={selectedDates.formatDatesInText}
            editable={stepForm === StepForm.TRIP_DETAILS}
            placeholder="When ?"
            onFocus={() => Keyboard.dismiss()}
            showSoftInputOnFocus={false}
            onPress={() =>
              stepForm === StepForm.TRIP_DETAILS &&
              setShowModal(MODAL_CONTROL.CALENDAR)
            }
          />
        </Input>

        {stepForm === StepForm.ADD_EMAIL && (
          <>
            <View className="border-b py-3 border-zinc-800">
              <Button
                variant="secondary"
                onPress={() => setStepForm(StepForm.TRIP_DETAILS)}
              >
                <Button.Title>Change place/date</Button.Title>
                <Settings2 size={20} color={colors.zinc[200]} />
              </Button>
            </View>

            <Input>
              <UserRoundPlus size={20} color={colors.zinc[400]} />
              <Input.Field
                autoCorrect={false}
                placeholder="Who is going with you ?"
                value={
                  emailsToInvite.length > 0
                    ? `${emailsToInvite.length} friend(s) invited.`
                    : ""
                }
                onPress={() => {
                  Keyboard.dismiss();
                  setShowModal(MODAL_CONTROL.GUESTS);
                }}
                showSoftInputOnFocus={false}
              />
            </Input>
          </>
        )}
        <Button onPress={handleNextStepForm} isLoading={isCreatingTrip}>
          <Button.Title>
            {stepForm === StepForm.TRIP_DETAILS ? "Continue" : "Confirm Trip"}
          </Button.Title>

          <ArrowRight size={20} color={colors.lime[950]} />
        </Button>
      </View>

      <Text className="text-zinc-500 font-regular text-base text-center">
        By using the Planner app to manage your trip you automatically agree to{" "}
        {""}
        <Text className="text-zinc-300 underline">
          our terms and privacy policy.
        </Text>
      </Text>

      <Modal
        title="Select dates"
        subtitle="Select the leave date and arrival date"
        visible={showModal === MODAL_CONTROL.CALENDAR}
        onClose={() => {
          setShowModal(MODAL_CONTROL.NONE);
        }}
      >
        <View className="gap-4 mt-4">
          <Calendar
            minDate={dayjs().toISOString()}
            onDayPress={handleSelectDate}
            markedDates={selectedDates.dates}
          />

          <Button onPress={() => setShowModal(MODAL_CONTROL.NONE)}>
            <Button.Title>Confirm</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title="Select guest"
        subtitle="The guests will get e-mails to confirm their trip"
        visible={showModal === MODAL_CONTROL.GUESTS}
        onClose={() => setShowModal(MODAL_CONTROL.NONE)}
      >
        <View className="my-2 flex-wrap gap-2 border-b border-zinc-800 py-5 items-start">
          {emailsToInvite.length > 0 ? (
            emailsToInvite.map((email) => (
              <GuestEmail
                key={email}
                email={email}
                onRemove={() => handleRemoveEmail(email)}
              />
            ))
          ) : (
            <Text className="text-zinc-600 text-base font-regular">
              No e-mail added so far.
            </Text>
          )}
        </View>

        <View className="gap-4 mt-4">
          <Input variant="secondary">
            <AtSign color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="Type the guest e-mail"
              keyboardType="email-address"
              onChangeText={(text) => setEmailToInvite(text.toLowerCase())}
              value={emailToInvite}
              returnKeyType="send"
              onSubmitEditing={handleAddEmail}
            />
          </Input>

          <Button onPress={handleAddEmail}>
            <Button.Title>Invite</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
};

export default Index;
