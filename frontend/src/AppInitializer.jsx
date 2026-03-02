import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadUser } from "./app/authSlice";

const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser()); // 👈 refresh fix
  }, [dispatch]);

  return children;
};

export default AppInitializer;
