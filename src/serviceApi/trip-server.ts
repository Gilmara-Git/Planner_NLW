import { api } from './api';

export type TripDetails = {
    id: string;
    destination: string;
    ends_at: string;
    starts_at: string;
    is_confirmed: boolean;
};


const getById = async(id: string)=>{
    try{
        const { data }  =  await api.get<{trip: TripDetails}>(`/trips/${id}`);


    }catch(error){
        throw error;
    }
};




export  { getById }