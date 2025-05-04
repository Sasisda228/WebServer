import type { NextApiResponse } from "next";

export default function handler(res: NextApiResponse) {
  // Здесь можно подключиться к БД или другому источнику данных
  // Для демонстрации возвращаем фиксированное значение
  res.status(200).json({ count: 12345 });
}
