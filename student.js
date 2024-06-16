const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "12345678",
    database: "postgres",
});

app.use(bodyParser.json());

// Add a new student
app.post('/students', async(req,res)=>
    {
        const{name,age,email}=req.body
        try{
            const result = await pool.query('insert into students(name,age,email) values($1,$2,$3) returning *',[name,age,email])
            res.status(201).json(result.rows[0]);
        }
        catch(err)
        {
            console.log(err);
            res.status(500).send("student is not created");
        }
    });
// Get all students
app.get('/students', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM students');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Get a single student by ID
app.get('/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).send('Student not found');
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Update a student
app.put('/students/:id', async (req, res) => {
    const { id } = req.params;
    const { name, age, email } = req.body;
    try {
        const result = await pool.query('UPDATE students SET name = $1, age = $2, email = $3 WHERE id = $4 RETURNING *', [name, age, email, id]);
        if (result.rows.length === 0) {
            return res.status(404).send('Student not found');
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Delete a student
app.delete('/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).send('Student not found');
        }
        res.status(200).send('Student deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
