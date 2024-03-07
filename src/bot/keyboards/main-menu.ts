import { Keyboard } from "grammy";

export const createMainMenuKeyboard = () => {
  return Keyboard.from([
    [
      {
        text: "📒 Тематики",
      },
    ],
  ]).resized();
};
