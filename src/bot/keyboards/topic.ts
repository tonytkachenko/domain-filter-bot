import { InlineKeyboard, Keyboard } from "grammy";

import { chunk } from "../helpers/index.js";

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
        text: "А",
        callback_data: `variant_2`,
      },
      {
        text: "B",
        callback_data: "variant_3",
      },
      {
        text: "C",
        callback_data: "variant_0",
      },
      {
        text: "D",
        callback_data: "variant_1",
      },
    ],
  ]);
};

export const createTopicsKeyboard = (
  topics: { id: number; name: string }[],
) => {
  return InlineKeyboard.from(
    chunk(
      topics.map((topic) => ({
        text: topic.name,
        callback_data: `topic_${topic.id}`,
      })),
      2,
    ),
  );
};
