import { InlineKeyboard, Keyboard } from "grammy";

export const createTopicAddKeyboard = () => {
  return Keyboard.from([
    [
      {
        text: "Добавить",
      },
    ],
  ]).resized();
};

export const createTopicDeleteKeyboard = (topicId: number) => {
  return InlineKeyboard.from([
    [
      {
        text: "Удалить",
        callback_data: `delete_${topicId}`,
      },
    ],
  ]);
};

export const createFilterModeKeyboard = () => {
  return InlineKeyboard.from([
    [
      {
        text: "Вариант А",
        callback_data: "variant_a",
      },
      {
        text: "Вариант B",
        callback_data: "variant_b",
      },
      {
        text: "Вариант C",
        callback_data: "variant_c",
      },
    ],
  ]);
};
