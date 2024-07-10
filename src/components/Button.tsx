import { TouchableOpacity, TouchableOpacityProps, Text, TextInputProps, ActivityIndicator  } from 'react-native';
import clsx from 'clsx';
import {  createContext , useContext } from 'react';


type Variants = 'primary' | 'secondary';


type ButtonProps =  TouchableOpacityProps & {
    variant?: Variants;
    isLoading?: boolean;
}

const ThemeContext = createContext<{variant?: Variants}>({});

const Button = ({variant= 'primary', isLoading, children, ...rest}: ButtonProps)=>{
    return ( 
    <TouchableOpacity  activeOpacity={0.7} className={clsx('w-full h-11 flex-row items-center justify-center rounded-lg gap-2', 
        { 'bg-lime-300': variant === 'primary',
           'bg-zinc-800': variant === 'secondary' 
        },
        
    )} {...rest}>

        <ThemeContext.Provider value={{variant}}>
            { isLoading ?  <ActivityIndicator className='text-lime-950'/> : children}
        </ThemeContext.Provider>
    </TouchableOpacity>)
};



const Title = ({ children }: TextInputProps )=>{
    const  {variant}  = useContext(ThemeContext);

    return ( 
                <Text className={clsx('text-base font-semibold', 
                    {
                       'text-lime-950': variant === 'primary',
                        'text-zinc-200': variant === 'secondary'  
                     }
            )}>
                {  children}</Text>
            );
}

Button.Title = Title;

export { Button } ;