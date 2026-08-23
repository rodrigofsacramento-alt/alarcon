const url = "https://ldfcqxeehgaftxsgxkag.supabase.co/rest/v1/profiles?select=*";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.JWT_SUPABASE_REDIGIDO.KfaCh5JYefV5kVlZeRg-cg_-4QELo8vhDK5TqpShuNY";

fetch(url, {
  headers: {
    "apikey": key,
    "Authorization": `Bearer ${key}`
  }
}).then(res => res.json()).then(console.log).catch(console.error);
