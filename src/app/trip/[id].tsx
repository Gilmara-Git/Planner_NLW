import { useState, useEffect } from 'react';
import { View , TouchableOpacity, Text, Keyboard, Alert } from 'react-native';
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

import { MapPin, Settings2, CalendarRange, Info, Calendar as IconCalendar } from 'lucide-react-native';
import { colors } from '@/styles/colors';
import dayjs from 'dayjs';
import { DatesSelected, calendarUtils } from "@/utils/calendarUtils";
import { DateData } from "react-native-calendars";



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
  
    const [isUpdatingTrip, setIsUpdatingTrip] = useState(false);
    const  [ isLoadingTrip, setIsLoadingTrip ] = useState(true);
    const  [ tripDetails, setTripDetails ] = useState({} as TripData);
    const [ option, setOption] = useState<"activity" | "details">("activity");

    const [showModal, setShowModal] = useState(MODAL.NONE);

    const [destination, setDestination] = useState("");
    const [selectedDates, setSelectedDates] = useState({} as DatesSelected)

    const tripId = useLocalSearchParams<{id: string}>().id;

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

            if(!tripId){
                return;
            }

            if (!destination || !selectedDates.startsAt || !selectedDates.endsAt) {
                return Alert.alert(
                  "Update trip",
                  "Remember to fill out the where you are going, leave and return dates."
                )
              }




            await tripServer.updateTrip({
                id: tripId,
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

            if(!tripId){
                return router.back();
            }
           const trip =  await tripServer.getById(tripId);

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

        </View>
    )
};

export default Trip;