const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
let cachedClient = null;
let cachedDb = null;

async function getDb() {
    if (cachedDb) return cachedDb;
    
    if (!uri) {
        throw new Error('MONGODB_URI environment variable not set');
    }

    const client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
    });
    
    await client.connect();
    cachedClient = client;
    cachedDb = client.db('payelfood');
    return cachedDb;
}

module.exports = async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const db = await getDb();
        const collection = db.collection('products');

        // GET - Fetch all products
        if (req.method === 'GET') {
            const { category } = req.query;
            let filter = {};
            if (category && category !== 'all') {
                filter.category = { $regex: new RegExp(category, 'i') };
            }
            const products = await collection.find(filter).sort({ _id: -1 }).toArray();
            return res.status(200).json({ success: true, count: products.length, products });
        }

        // POST - Add new product
        if (req.method === 'POST') {
            const product = req.body;
            if (!product.name) {
                return res.status(400).json({ success: false, message: 'Product name is required' });
            }
            product.createdAt = new Date();
            product.price = Number(product.price) || 0;
            product.mrp = Number(product.mrp) || 0;
            product.stock = Number(product.stock) || 0;
            const result = await collection.insertOne(product);
            return res.status(201).json({ success: true, id: result.insertedId, message: 'Product added!' });
        }

        // PUT - Update product
        if (req.method === 'PUT') {
            const { id, ...updateData } = req.body;
            if (!id) return res.status(400).json({ success: false, message: 'Product ID required' });
            updateData.updatedAt = new Date();
            updateData.price = Number(updateData.price) || 0;
            updateData.mrp = Number(updateData.mrp) || 0;
            updateData.stock = Number(updateData.stock) || 0;
            await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
            return res.status(200).json({ success: true, message: 'Product updated!' });
        }

        // DELETE - Delete product
        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ success: false, message: 'Product ID required' });
            await collection.deleteOne({ _id: new ObjectId(id) });
            return res.status(200).json({ success: true, message: 'Product deleted!' });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });
    } catch (error) {
        console.error('API Error:', error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Database connection failed. Check MONGODB_URI in Vercel environment variables.',
            error: error.message 
        });
    }
};
