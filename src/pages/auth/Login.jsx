import "./auth.scss";
import { Form, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Logo from "../../assets/images/bingus_logo.svg";
import GoogleLogo from "../../assets/images/google.svg";
import { useAuthContext } from "../../hooks/useAuthContext";
import { myFetch } from "../../utils/myFetch";
import { IconAlertOctagon } from "@tabler/icons-react";
import Loader from "../../components/Loaders/Loader";
const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState();
  const [disabled, setDisabled] = useState(false);
  const { dispatch } = useAuthContext();
  const [searchParams] = useSearchParams(); //Auth redirect here, redirect to home page

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const userParam = searchParams.get("username");
    const idParam = searchParams.get("id");
    const profilePictureParam = searchParams.get("profilePicture");
    if (tokenParam && userParam && idParam && profilePictureParam) {
      //as long as one is present we can do this
      const payload = {
        token: tokenParam,
        username: userParam,
        id: idParam,
        profilePicture: profilePictureParam,
      };
      dispatch({ type: "LOGIN", payload: payload });
      localStorage.setItem("user", JSON.stringify(payload));
      navigate("/p/home");
    }
  }, []);

  const handleSubmit = async (e, inputUser, inputPass) => {
    setDisabled(true);
    if (e) e.preventDefault();
    try {
      const username = inputUser ? inputUser : e?.target.username.value;
      const password = inputPass ? inputPass : e?.target.password.value;
      // const data = await myFetch("/auth/local/login", {
      //   method: "POST",
      //   body: JSON.stringify({
      //     username,
      //     password,
      //   }),
      // });
      dispatch({ type: "LOGIN", payload: data }); //username, id , profilepicture, token
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/p/home");
    } catch (err) {
      console.log(err);
      setDisabled(false);
      setError(err.message);
    }
  };

  return (
    <>
      <img src={Logo} alt="" />
      <p>Welcome back!</p>
      <p>Please fill in your login details</p>
      <Form onSubmit={handleSubmit} className="form-general login">
        <input
          // ref={username}
          name="username"
          type="text"
          placeholder="Username"
          minLength="2"
          maxLength="35"
          pattern="^[a-zA-Z0-9_.]*$"
          autoComplete="new-password"
          title="Username must be alphanumeric, and may contain periods, understore, and hypens"
          required
        />
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="Password"
          minLength="2"
          required
        />
        <button disabled={disabled} type="submit">
          Login
        </button>
      </Form>
      <button
        onClick={() => {
          handleSubmit(null, "GuestUser", "123123");
        }}
        id="guest-login"
      >
        Guest User
      </button>

      <p className="signup">
        Don't have an account?{" "}
        <span onClick={() => navigate("../signup")}>Sign up</span>
        {disabled && <Loader color="grey" loading={true} />}
      </p>
      <p className="error-box">
        {error ? (
          <>
            <IconAlertOctagon size="18px" />
            {error}
          </>
        ) : (
          ""
        )}
      </p>

      <p className="or">
        <span>or</span>
      </p>

      {/* <button
        className="google"
        onClick={() => {
          window.location.href = `${API_URL}/auth/oauth/google`;
        }}
      >
        <img className="google-icon" src={GoogleLogo} alt="" />
        <span>Continue with Google</span>
      </button> */}
    </>
  );
};

export default Login;

//username between 2-35
///^[a-zA-Z0-9_.]*$/
