interface SignupFormData {
  username: string;
  email: string;
  password: string;
  //profilePicture: string;
};

export function SignupForm(userData: SignupFormData) {
    if (userData) {
      const userJson = JSON.stringify(userData, null, 2);
      console.log(userJson);
      // await fetch("api", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: userJson,
      // });
    }
    return null
  };

export default SignupForm;
