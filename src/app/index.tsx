import { useState } from 'react';
import { View, Image, Text } from 'react-native';
import  { MapPin , Calendar as IconCalendar, Settings2, UserRoundPlus, ArrowRight } from 'lucide-react-native';
import { colors } from '@/styles/colors';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';


enum StepForm {
    TRIP_DETAILS = 1,
    ADD_EMAIL = 2,
 }


export const Index =()=>{
    const [ stepForm, setStepForm ] = useState(StepForm.TRIP_DETAILS);


    const handleNextStepForm = () =>{
        if(stepForm === StepForm.TRIP_DETAILS){
            return setStepForm(StepForm.ADD_EMAIL);
        }
    };

    return ( 
    <View className='flex-1 items-center justify-center px-5'>
        <Image 
            source={require('@/assets/logo.png')} 
            className='h-8' 
            resizeMode='contain'
            />

        <Text className='text-zinc-400 font-regular text-center text-lg mt-3'>
            Invite your friends and  plan {'\n'} your next trip.
        </Text>


        <View className='p-4 bg-zinc-900 rounded-xl my-8 w-full border border-zinc-800'>
            <Input >
                <MapPin size={20} color={colors.zinc[400]}/>
                <Input.Field editable={stepForm === StepForm.TRIP_DETAILS} placeholder='Where are you going to ?'  />
            </Input>

            <Input>
                <IconCalendar size={20} color={colors.zinc[400]}/>
                <Input.Field editable={stepForm === StepForm.TRIP_DETAILS}  placeholder='When ?'  />
            </Input>

            { stepForm === StepForm.ADD_EMAIL &&
            
            <>    
                <View className='border-b py-3 border-zinc-800'>
                    <Button variant='secondary' onPress={()=>setStepForm(StepForm.TRIP_DETAILS)}>
                    <Button.Title >Change place/date</Button.Title>
                        <Settings2 size={20} color={colors.zinc[200]}/>
                    </Button>
                </View>

                <Input >
                    <UserRoundPlus size={20} color={colors.zinc[400]}/>
                    <Input.Field  placeholder='Who is going with you ?'  />
                </Input>
            </>
            }
            <Button onPress={handleNextStepForm}>
                  <Button.Title >
                    { stepForm === StepForm.TRIP_DETAILS? 'Continue': 'Confirm Trip' }
                    </Button.Title>

                    <ArrowRight size={20} color={colors.lime[950]}/>
            </Button>

        </View>

        <Text className='text-zinc-500 font-regular text-base text-center'>
            By using the Planner app to manage your trip you automatically agree to {''}
            <Text className='text-zinc-300 underline'>
                our terms and privacy policy.
                </Text>
        </Text>

    </View>)
};

export default Index;