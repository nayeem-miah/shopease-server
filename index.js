const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s2dzxgz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const productsCollection = client.db("shopease").collection("products");

        // Products
        app.get('/products', async (req, res) => {
            const { page = 1, limit = 10, search = '', brand = '', category = '', priceRange = '' } = req.query;
            const skip = (page - 1) * limit;
            const query = {};
        
            if (search) {
                query.productName = { $regex: search, $options: 'i' };
            }
            if (brand) {
                query.brandName = brand;
            }
            if (category) {
                query.category = category;
            }
            if (priceRange) {
                const [minPrice, maxPrice] = priceRange.split('-').map(Number);
                query.price = { $gte: minPrice, $lte: maxPrice ? maxPrice : Infinity };
            }
        
            const totalProducts = await productsCollection.countDocuments(query);
            const products = await productsCollection.find(query).skip(skip).limit(limit).toArray();
        
            res.send({
                products,
                totalPages: Math.ceil(totalProducts / limit),
                currentPage: parseInt(page)
            });
        });
        

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir); 

app.get()

app.listen(port, () => {
    console.log(`ShopEase server is running on port ${port}`);
});