import '@/styles/global.css';
import { Slot } from 'expo-router';
import { View , StatusBar } from 'react-native';
import { Loading } from '@/components/Loading';


import { 
    useFonts, 
    Inter_400Regular, 
    Inter_500Medium,  
    Inter_600SemiBold, 
} from '@expo-google-fonts/inter';

const Layout =()=>{

    const [ fontsLoaded ] = useFonts({
        Inter_400Regular, 
        Inter_500Medium,  
        Inter_600SemiBold
    });


    if(!fontsLoaded){
        return <Loading/>
    }

    return (
        <View className='flex-1 bg-zinc-950'>
             <StatusBar 
                barStyle='light-content' 
                backgroundColor='transparent' 
                translucent
                /> 
           
            <Slot />

        </View> 
    )
};

export default Layout;