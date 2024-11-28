import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetch = (url, method = 'GET', body = null, options = {}) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await axios({
                    url,
                    method,
                    data: body,
                    withCredentials: true,
                    ...options,
                });
                setData(response.data);
            } catch (error) {
                setError(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [url, method, body, JSON.stringify(options)]);

    return { data, error, isLoading };
};

export default useFetch;




// who to use

// 1. get
// const { data, error, isLoading } = useFetch('https://api.example.com/users', 'GET');
// if (isLoading) return <p>Loading...</p>;
// if (error) return <p>Error: {error.message}</p>;
// {data && (
//     <ul>
//         {data.map((user) => (
//             <li key={user.id}>{user.name}</li>
//         ))}
//     </ul>
// )}


// 2. post/put
// const { data, error, isLoading } = useFetch(
//     'https://api.example.com/users',
//     'POST',
//     { name: 'John Doe', email: 'johndoe@example.com' },
//     { headers: { 'Content-Type': 'application/json' } }
// );


// *
// const apiClient = axios.create({
//     baseURL: process.env.REACT_APP_API_URL,
//     headers: {
//       'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
//     },
//   });