import { View, Image, Text } from 'react-native';

export const Index =()=>{
    return ( 
    <View className='flex-1 items-center justify-center'>
        <Image 
            source={require('@/assets/logo.png')} 
            className='h-8' 
            resizeMode='contain'
            />

        <Text className='text-zinc-400 font-regular text-center text-lg mt-3'>
            Invite your friends and  plan {'\n'} your next trip.
        </Text>

    </View>)
};

export default Index;