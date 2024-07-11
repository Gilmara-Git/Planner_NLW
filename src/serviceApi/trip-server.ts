import { api } from './api';

export type TripDetails = {
    id: string;
    destination: string;
    ends_at: string;
    starts_at: string;
    is_confirmed: boolean;
};


type TripCreate = Omit<TripDetails, 'id' | 'is_confirmed'> & {
    emails_to_invite: string[];
};

const getById = async(id: string)=>{
    try{
        const { data }  =  await api.get<{trip: TripDetails}>(`/trips/${id}`);

        return data.trip;

    }catch(error){
        throw error;
    }
};

const createTrip = async({ destination, ends_at, starts_at, emails_to_invite }: TripCreate)=>{
    // como ainda não tem autenticacao social (google por exemplo colocamos o nome e email fixo por enquanto)

    try{
        const { data }  =  await api.post<{tripId: string}>('/trips', {
            destination,
            ends_at,
            starts_at,
            emails_to_invite,
            owner_name: 'Gilmara Pimentel',
            owner_email: 'gilmarapq@hotmail.com'

        });

        
        return data.tripId;


    }catch(error){
        throw error;
    }
}



export const tripServer =  { getById , createTrip };
