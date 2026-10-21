const request = require("supertest");
const app = require("../src/app");
const dishes = require("../src/data/dishes-data");
const orders = require("../src/data/orders-data");

const dish = { id: "dish-1", name: "Soup", description: "Vegetable soup", price: 500, image_url: "https://example.com/soup.jpg" };
const order = { id: "order-1", deliverTo: "Fictional address", mobileNumber: "555-0100", status: "pending", dishes: [{ ...dish, quantity: 1 }] };

beforeEach(() => {
  dishes.splice(0, dishes.length, { ...dish });
  orders.splice(0, orders.length, JSON.parse(JSON.stringify(order)));
});

describe("validation regressions", () => {
  test.each([-1, 1.5, "2", null])("rejects invalid quantity %p without creating an order", async quantity => {
    const response = await request(app).post("/orders").send({ data: { ...order, dishes: [{ ...dish, quantity }] } });
    expect(response.status).toBe(400);
    expect(orders).toHaveLength(1);
  });

  test("rejects null dish entries without crashing", async () => {
    const response = await request(app).post("/orders").send({ data: { ...order, dishes: [null] } });
    expect(response.status).toBe(400);
    expect(orders).toHaveLength(1);
  });

  test("rejects arbitrary update statuses without modifying the order", async () => {
    const response = await request(app).put("/orders/order-1").send({ data: { ...order, status: "banana" } });
    expect(response.status).toBe(400);
    expect(orders[0]).toEqual(order);
  });

  test("allows marking an active order delivered", async () => {
    const response = await request(app).put("/orders/order-1").send({ data: { ...order, status: "delivered" } });
    expect(response.status).toBe(200);
    expect(orders[0].status).toBe("delivered");
  });

  test("prevents modifying a stored delivered order", async () => {
    orders[0].status = "delivered";
    const response = await request(app).put("/orders/order-1").send({ data: { ...order, status: "preparing" } });
    expect(response.status).toBe(400);
    expect(orders[0].status).toBe("delivered");
  });

  test.each([undefined, null, ""])('preserves dish identity when body id is %p', async id => {
    const response = await request(app).put("/dishes/dish-1").send({ data: { ...dish, id, name: "Updated soup" } });
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe("dish-1");
    expect((await request(app).get("/dishes/dish-1")).status).toBe(200);
  });

  test("rejects fractional prices", async () => {
    const response = await request(app).post("/dishes").send({ data: { ...dish, price: 1.5 } });
    expect(response.status).toBe(400);
    expect(dishes).toHaveLength(1);
  });

  test.each(["dishes", "orders"])("rejects null data for %s", async resource => {
    const response = await request(app).post(`/${resource}`).send({ data: null });
    expect(response.status).toBe(400);
  });

  test("a rejected validator invokes next only once", () => {
    const validate = require("../src/orders/orders.controller").create[0];
    const next = jest.fn();
    validate({ body: { data: {} } }, { locals: {} }, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].status).toBe(400);
  });
});
