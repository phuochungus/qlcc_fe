
const baseUrl = "https://homeland-be.onrender.com"
// const baseUrl = "http://localhost:5002";
export const endpoint = {
  login: baseUrl + "/auth/signin",
  profile: baseUrl + "/me",
  tokenValidate: baseUrl + "/token/validate",
  resident: baseUrl + "/resident",
  apartment: baseUrl + "/apartment",
    employee: baseUrl + "/employee",
  person: baseUrl + "/person",
    me: baseUrl + "/me",
  building: baseUrl + "/building",
};
