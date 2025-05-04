// app/api/count/route.ts

export async function GET() {
  // Здесь можно подключиться к БД или другому источнику данных
  // Для демонстрации возвращаем фиксированное значение
  return Response.json({ count: 12345 });
}
