import { View , TextInput , TextInputProps } from 'react-native';
import React, { ReactNode } from 'react';
import clsx from 'clsx';
import { colors } from '@/styles/colors';

type Variants = 'primary'| 'secondary'| 'tertiary';

type InputProps =  {
    children: ReactNode;
    variant?: Variants;
}

const Input = ( { children, variant = 'primary' }: InputProps ) =>{
    return (
        <View className={clsx(
            'w-full h-16 flex-row items-center gap-2',
            {
            
            'h-14 px-4 rounded-lg border border-zinc-800' : variant !== 'primary',
            'bg-zinc-950': variant === 'secondary',
            'bg-zinc-900' : variant === 'tertiary'
        }

        )}> 
            { children}
        </View>
    ) 

};

//selectionColor applies to both iOS and Android whereas cursorColor only applies to Android

const Field = ({...rest}: TextInputProps)=>{
    return (
    <TextInput 
        className='flex-1 text-zinc-100 text-lg font-regular' 
        placeholderTextColor={colors.zinc[400]}
        selectionColor={colors.lime[300]}
        {...rest}>

    </TextInput>
    )
};


Input.Field =  Field;

export { Input };