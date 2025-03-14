import { configureStore } from "@reduxjs/toolkit";
import classReducer from "../slices/ClassSlice.jsx";

export const store = configureStore({
  reducer: {
    class: classReducer,
  },
});
