'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function CurrentUserExample() {
  const [user, setUser]: [any, React.Dispatch<React.SetStateAction<any>>] =
    useState(null);

  useEffect(() => {
    axios
      .get('/api/user', { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch((err:unknown) => {
          if (err instanceof Error)
        console.log('Not logged in', err)
      });
  }, []);

  return (
    <div>
      {user ? <h2>Welcome, {user.username}</h2> : <p>You are not logged in.</p>}
    </div>
  );
}
