import React, { useState } from 'react';
import "./Login.scss";
import Loader from "../../Utils/Loader/loader";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Controller, useForm } from "react-hook-form";
import { errorToast } from '../../Services/api';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import image from "../../assets/bg.jpg"

const Login = () => {
  // const auth = useSelector((state: RootState) => state.auth);
  const datas = useSelector((state: RootState) => state.data);
  const dispatch = useDispatch();
  const updateAuth = (value: Partial<AuthState>) => {
    dispatch({ type: "UPDATE_AUTH", value });
  };
  const [isloging, setIsLoging] = useState<boolean>(false);

  const defaultValues = {
    email: "",
    password: "",
  };

  // variables du formulaire
  const {
    control,
    getValues,
    handleSubmit,
  } = useForm({ defaultValues });

  const onSubmit = () => {
    setIsLoging(true);
    const data = getValues();
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/user/login`, data)
      .then((res) =>
        updateAuth({
          userId: res.data.userId,
          isConnected: true,
          token: res.data.token,
          header: { headers: { Authorization: `Bearer ${res.data.token}` } }
        })
      )
      .catch(() => datas.toast && errorToast("L'authentification a échoué"))
      .finally(() => setIsLoging(false));
  };

  return (
    <div className="login_container">
      <img src={image} alt="background home" />
      <div className="login_container_title">
        <h1>Bienvenue sur MyNotes !</h1>
      </div>
      <form className="login__form" onSubmit={handleSubmit(onSubmit)}>
        <div className="login__form__field">
          <h4>Adresse email</h4>
          <Controller
            name="email"
            control={control}
            rules={{
              required: "L'email est obligatoire",
            }}
            render={({ field }) => (
              <InputText
                {...field}
                placeholder="Adresse email"
                className="login__form__field-email"
                type="email"
              />
            )}
          />
        </div>
        <div className="login__form__field">
          <h4>Mot de passe</h4>
          <Controller
            name="password"
            control={control}
            rules={{
              required: "Le mot de passe est obligatoire",
            }}
            render={({ field }) => (
              <Password
                {...field}
                placeholder={"Mot de passe"}
                className="login__form__field-password"
                feedback={false}
              />
            )}
          />
        </div>
        <div className="login__form__button">
          {isloging ? <Loader /> : <Button>Se connecter</Button>}
        </div>
      </form>
    </div>
  );
};

export default Login;