import { View, Image, Text } from 'react-native';
import  { MapPin , Calendar as IconCalendar, Settings2, UserRoundPlus, ArrowRight } from 'lucide-react-native';
import { colors } from '@/styles/colors';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';


export const Index =()=>{

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
                <Input.Field  placeholder='Where are you going to ?'  />
            </Input>

            <Input >
                <IconCalendar size={20} color={colors.zinc[400]}/>
                <Input.Field  placeholder='When ?'  />
            </Input>

            <View className='border-b py-3 border-zinc-800'>
                <Button variant='secondary'>
                  <Button.Title >Change place/date</Button.Title>
                    <Settings2 size={20} color={colors.zinc[200]}/>
                </Button>
            </View>

            <Input >
                <UserRoundPlus size={20} color={colors.zinc[400]}/>
                <Input.Field  placeholder='Who is going with you ?'  />
            </Input>

            <Button>
                  <Button.Title >Continue</Button.Title>
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