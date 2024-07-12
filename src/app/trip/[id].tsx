import { useState, useEffect } from 'react';
import { View , TouchableOpacity, Text, Keyboard, Alert, } from 'react-native';
import { useLocalSearchParams} from 'expo-router';
import { TripDetails } from '@/serviceApi/trip-server';
import { Loading } from '@/components/Loading';
import { tripServer } from '@/serviceApi/trip-server';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Calendar } from "@/components/Calendar";

import { Activities} from '@/app/trip/activities';
import { Details } from '@/app/trip/details' ;

import {Mail, MapPin, Settings2, CalendarRange, Info, Calendar as IconCalendar , User} from 'lucide-react-native';
import { colors } from '@/styles/colors';
import dayjs from 'dayjs';
import { DatesSelected, calendarUtils } from "@/utils/calendarUtils";
import { DateData } from "react-native-calendars";
import { validateInput } from '@/utils/validateInput';
import { participantsServer } from '@/serviceApi/participants-server';
import { tripStorage } from '@/storage/trip';



export type TripData =  TripDetails & {
when: string;
};

enum MODAL {
    NONE = 0,
    UPDATE_TRIP = 1,
    CALENDAR = 2,
    CONFIRM_ATTENDANCE = 3,
  }
  

const Trip = ()=>{
    const [ isConfirmingAttendance, setIsConfirmingAttendance] = useState(false);
    const [ guestEmail, setGuestEmail]  = useState('');
    const [ guestName, setGuestName]  = useState('');
    const [isUpdatingTrip, setIsUpdatingTrip] = useState(false);
    const  [ isLoadingTrip, setIsLoadingTrip ] = useState(true);
    const  [ tripDetails, setTripDetails ] = useState({} as TripData);
    const [ option, setOption] = useState<"activity" | "details">("activity");

    const [showModal, setShowModal] = useState(MODAL.CONFIRM_ATTENDANCE);
    const [ ] = useState(false);
    const [destination, setDestination] = useState("");
    const [selectedDates, setSelectedDates] = useState({} as DatesSelected)

    const tripParams = useLocalSearchParams<{
      id: string
      participant?: string
    }>();


  const handleConfirmAttendance = async ()=>{
    try {
      if (!tripParams.id || !tripParams.participant) {
        return
      }

      if (!guestName.trim() || !guestEmail.trim()) {
        return Alert.alert(
          "Confirmation",
          "Fill out name and  e-mail to confirm your trip!"
        )
      }

      if (!validateInput.email(guestEmail.trim())) {
        return Alert.alert("Confirmation", "Invalid E-mail!")
      }

      setIsConfirmingAttendance(true)

      await participantsServer.confirmTripByParticipantId({
        participantId: tripParams.participant,
        name: guestName,
        email: guestEmail.trim(),
      })

      Alert.alert("Confirmation", "Trip confirmed successfully!")

      await tripStorage.saveTripIdOnStorage(tripParams.id)

      setShowModal(MODAL.NONE)
    } catch (error) {
      console.log(error)
      Alert.alert("Confirmação", "Não foi possível confirmar!")
    } finally {
      setIsConfirmingAttendance(false)
    }
  };

    const handleSelectDate = (selectedDay: DateData) => {
        const dates = calendarUtils.orderStartsAtAndEndsAt({
          startsAt: selectedDates.startsAt,
          endsAt: selectedDates.endsAt,
          selectedDay,
        });

        setSelectedDates(dates)
    }


    const handleUpdateTrip = async()=>{
        try{
            setIsUpdatingTrip(true);

            if(!tripParams.id){
                return;
            }

            if (!destination || !selectedDates.startsAt || !selectedDates.endsAt) {
                return Alert.alert(
                  "Update trip",
                  "Remember to fill out the where you are going, leave and return dates."
                )
              }




            await tripServer.updateTrip({
                id: tripParams.id,
                destination,
                starts_at: dayjs(selectedDates.startsAt.dateString).toString(),
                ends_at: dayjs(selectedDates.endsAt.dateString).toString(),
              })
        
              Alert.alert("Update trip", "Trip was successfully updated!", [
                {
                  text: "OK",
                  onPress: () => {
                    setShowModal(MODAL.NONE)
                    getTripDetails()
                  },
                },
              ])



         }catch(error){
            console.log(error);
        } finally{
            setIsUpdatingTrip(false);
        }
    }

    const handleRemoveTrip = ()=>{}

    const getTripDetails = async()=>{
        try{
            setIsLoadingTrip(true);

            if(!tripParams.id){
                return router.back();
            }
           const trip =  await tripServer.getById(tripParams.id);

            const maxDestinationLength = 14;
            const destination =  trip.destination.length >  maxDestinationLength ? 
            trip.destination.slice(0,maxDestinationLength) + '...' : trip.destination;

            const starts_at = dayjs(trip.starts_at).format('DD');
            const ends_at = dayjs(trip.ends_at).format('DD');
            const month = dayjs(trip.starts_at).format('MMM');

            setDestination(trip.destination);

           setTripDetails({
            ...trip,
            when: `${destination} from ${starts_at} to ${ends_at} in ${month}.`,


           })

        }catch(error){
            console.log(error)
        }finally{
            setIsLoadingTrip(false);
        }
    };


    useEffect(()=>{
        getTripDetails()
    },[])


    if(isLoadingTrip){
        <Loading/>
    }

    return (
        <View className='flex-1 px-5 pt-16'>
            <Input variant='tertiary'>
                <MapPin size={20} color={colors.zinc[400]}/>

                <Input.Field  value={tripDetails.when} readOnly/>

            <TouchableOpacity 
                activeOpacity={0.7} 
                className='w-9 h-9 bg-zinc-800 items-center justify-center rounded-xl'
                onPress={()=>setShowModal(MODAL.UPDATE_TRIP)}
                >
                <Settings2  size={20} color={colors.zinc[400]}/>
            </TouchableOpacity>
            </Input>

            { option === "activity" ? <Activities tripDetails={tripDetails}/> : <Details tripId={tripDetails.id} /> }

            <View className='w-full absolute -bottom-1 self-center justify-end pb-5 z-10 bg-zinc-950'>
                <View className='w-full flex-row bg-zinc-900 p-4 rounded-lg border border-zinc-800 gap-2'>

                    <Button variant={option === 'activity'? 'primary': 'secondary' }className='flex-1' onPress={()=>setOption('activity')}>
                        <CalendarRange size={20} color={option === 'activity'? colors.lime[950]: colors.zinc[200]} />
                        <Button.Title>Activities</Button.Title>
                    </Button>

                    <Button variant={option === 'details'? 'primary': 'secondary'} className='flex-1' onPress={()=>setOption('details')}>
                    <Info size={20} color={option === 'details'? colors.lime[950]: colors.zinc[200]} />
                        <Button.Title>Details</Button.Title>
                    </Button>


                </View>

            </View>

            
      <Modal
        title="Update Trip"
        subtitle="Only who created the trip can edit it."
        visible={showModal === MODAL.UPDATE_TRIP}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="gap-2 my-4">
          <Input variant="secondary">
            <MapPin color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="To Where?"
              onChangeText={setDestination}
              value={destination}
            />
          </Input>

          <Input variant="secondary">
            <IconCalendar color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="When?"
              value={selectedDates.formatDatesInText}
              onPressIn={() => setShowModal(MODAL.CALENDAR)}
              onFocus={() => Keyboard.dismiss()}
            />
          </Input>
        </View>

        <Button onPress={handleUpdateTrip} isLoading={isUpdatingTrip}>
          <Button.Title>Update</Button.Title>
        </Button>

        <TouchableOpacity activeOpacity={0.8} onPress={handleRemoveTrip}>
          <Text className="text-red-400 text-center mt-6">Remove trip</Text>
        </TouchableOpacity>
      </Modal>

      <Modal
        title="Select dates"
        subtitle="Select the leave date and return date."
        visible={showModal === MODAL.CALENDAR}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="gap-4 mt-4">
          <Calendar
            minDate={dayjs().toISOString()}
            onDayPress={handleSelectDate}
            markedDates={selectedDates.dates}
          />

          <Button onPress={() => setShowModal(MODAL.UPDATE_TRIP)}>
            <Button.Title>Confirm</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title="Confirm your attendance"
        visible={showModal === MODAL.CONFIRM_ATTENDANCE}
      >
        <View className="gap-4 mt-4">
          <Text className="text-zinc-400 font-regular leading-6 my-2">
            You have been invited to participate on a trip to
            <Text className="font-semibold text-zinc-100">
              {" "}
              {tripDetails.destination}{" "}
            </Text>
            on dates {" "}
            <Text className="font-semibold text-zinc-100">
              {dayjs(tripDetails.starts_at).date()} to{" "}
              {dayjs(tripDetails.ends_at).date()} from{" "}
              {dayjs(tripDetails.ends_at).format("MMMM")}. {"\n\n"}
            </Text>
            To confirm your presence on this trip, fill out the data below:
           
          </Text>

          <Input variant="secondary">
            <User color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="Your full name"
              onChangeText={setGuestName}
            />
          </Input>

          <Input variant="secondary">
            <Mail color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="E-mail de confirmação"
              onChangeText={setGuestEmail}
            />
          </Input>

          <Button
            isLoading={isConfirmingAttendance}
            onPress={handleConfirmAttendance}
          >
            <Button.Title>Confirm my attendance</Button.Title>
          </Button>
        </View>
      </Modal>

        </View>
    )
};

export default Trip;