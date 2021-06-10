import * as yup from "yup";
import { Form, Formik, Field, ErrorMessage } from "formik";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect } from "react";

const schema = yup.object().shape({
  email: yup.string().required("Email Required").email("Invalid Email"),
  password: yup.string().required("Password Required"),
});

const Login = () => {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("innsight-token")) router.replace("/");
  }, []);

  return (
    <div className="h-screen flex dark:bg-gray-900 dark:text-white">
      <div className="my-auto w-full max-w-md mx-auto">
        <img src="/innsight.png"></img>
        <h1 className="text-2xl font-bold mb-1">Login</h1>
        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={async ({ email, password }, { setErrors }) => {
            try {
              const { data } = await axios.post(
                "https://innsight.innatical.com/login",
                {
                  email,
                  password,
                }
              );
              localStorage.setItem("innsight-token", data.token);
              router.replace("/");
            } catch (e) {
              console.log(e.response.data.error);
              switch (e.response.data.error) {
                case "InvalidPassword":
                  setErrors({
                    password: "Invalid Password",
                  });
                  break;
                case "UserNotFound":
                  setErrors({
                    password: "Invalid Email",
                  });
              }
            }
          }}
          validationSchema={schema}
        >
          <Form>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <Field
              type="email"
              name="email"
              id="email"
              className="block w-full p-2 sm:text-sm border-gray-300 bg-gray-100 rounded-md dark:bg-gray-800 mb-2"
              placeholder="lleyton@innatical.com"
            />
            <ErrorMessage
              name="email"
              className="sm:text-sm text-red-600"
              component="p"
            />
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <Field
              type="password"
              name="password"
              id="password"
              className="block w-full p-2 sm:text-sm border-gray-300 bg-gray-100 rounded-md dark:bg-gray-800"
            />
            <ErrorMessage
              name="password"
              className="sm:text-sm text-red-600"
              component="p"
            />

            <button
              type="submit"
              className="block py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 mt-2"
            >
              Login
            </button>
          </Form>
        </Formik>
      </div>
    </div>
  );
};

export default Login;
