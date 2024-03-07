import { Keyboard } from "grammy";

export const createCancelKeyboard = () => {
  return Keyboard.from([
    [
      {
        text: "❌ Отмена",
      },
    ],
  ]).resized();
};
