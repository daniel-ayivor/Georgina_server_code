const productSchema = {
    type: "object",
    properties: {
        id: { type: "integer", description: "Unique identifier for the product" },
        title: { type: "string", description: "Name of the product" },
        price: { type: "number", description: "Price of the product" },
        text: { type: "string", description: "Detailed description of the product" }
    },
    required: ["id", "title", "price"]
};
