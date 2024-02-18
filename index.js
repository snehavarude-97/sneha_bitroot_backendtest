const connection = require('./connection');
const express = require('express');
const bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json())

//to fetch all contacts
app.get('/employees', (req, res) => {
    const query = `SELECT * FROM employee`;
    connection.query(query, (err, results) => {
      if (err) {
        console.log(err);
      }else
      res.send(results);
    });
  });

  //to create new contact
app.post('/createEmployee', (req, res) => {
    const { empname, phoneno, city, pincode, street, picture } = req.body;
  
    // Validate input data
    if (!empname || !phoneno || !city || !pincode || !street || !picture) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    // Execute SQL queries to insert data into respective tables
    connection.beginTransaction((err) => {
      if (err) {
        console.error('Error beginning transaction:', err);
        return res.status(500).json({ error: 'Error beginning transaction' });
      }
  
      const employeeQuery = 'INSERT INTO employee (empname, phoneno) VALUES (?, ?)';
      connection.query(employeeQuery, [empname, phoneno], (err, result) => {
        if (err) {
          connection.rollback(() => {
            console.error('Error inserting data into employee table:', err);
            return res.status(500).json({ error: 'Error inserting data into employee table' });
          });
        }
        
      
        const employeeId = result.insertId;
        
        const addressQuery = 'INSERT INTO address (city, pincode, street, empid) VALUES (?, ?, ?, ?)';
        connection.query(addressQuery, [city, pincode, street, employeeId], (err, result) => {
          if (err) {
            connection.rollback(() => {
              console.error('Error inserting data into address table:', err);
              return res.status(500).json({ error: 'Error inserting data into address table' });
            });
          }
  
         
          const profilePictureQuery = 'INSERT INTO profilepicture (picture,empid) VALUES (?,?)';
          connection.query(profilePictureQuery, [picture,employeeId], (err, result) => {
            if (err) {
              connection.rollback(() => {
                console.error('Error inserting data into profilepicture table:', err);
                return res.status(500).json({ error: 'Error inserting data into profilepicture table' });
              });
            }
  
            connection.commit((err) => {
              if (err) {
                connection.rollback(() => {
                  console.error('Error committing transaction:', err);
                  return res.status(500).json({ error: 'Error committing transaction' });
                });
              }
              console.log('Transaction committed successfully');
              res.status(201).json({ message: 'Record created successfully' });
            });
          });
        });
      });
    });
  });
  
  // DELETE endpoint to delete a contact
app.delete('/deleteContact/:empid', (req, res) => {
    const empid = req.params.empid;
  
    // Begin a transaction
    connection.beginTransaction((err) => {
      if (err) {
        console.error('Error beginning transaction:', err);
        return res.status(500).json({ error: 'Error beginning transaction' });
      }
  
      // Delete from profilepicture table
      const deleteProfilePictureQuery = 'DELETE FROM profilepicture WHERE id = (SELECT id FROM address WHERE empid = ?)';
      connection.query(deleteProfilePictureQuery, [empid], (err, result) => {
        if (err) {
          connection.rollback(() => {
            console.error('Error deleting record from profilepicture table:', err);
            return res.status(500).json({ error: 'Error deleting record from profilepicture table' });
          });
        }
  
        // Delete from address table
        const deleteAddressQuery = 'DELETE FROM address WHERE empid = ?';
        connection.query(deleteAddressQuery, [empid], (err, result) => {
          if (err) {
            connection.rollback(() => {
              console.error('Error deleting record from address table:', err);
              return res.status(500).json({ error: 'Error deleting record from address table' });
            });
          }
  
          // Delete from employee table
          const deleteEmployeeQuery = 'DELETE FROM employee WHERE empid = ?';
          connection.query(deleteEmployeeQuery, [empid], (err, result) => {
            if (err) {
              connection.rollback(() => {
                console.error('Error deleting record from employee table:', err);
                return res.status(500).json({ error: 'Error deleting record from employee table' });
              });
            }
  
            // Commit the transaction
            connection.commit((err) => {
              if (err) {
                connection.rollback(() => {
                  console.error('Error committing transaction:', err);
                  return res.status(500).json({ error: 'Error committing transaction' });
                });
              }
              console.log('Transaction committed successfully');
              res.status(200).json({ message: 'Contact deleted successfully' });
            });
          });
        });
      });
    });
  });

  // PUT endpoint to update data in Employee, Address, and ProfilePicture tables
app.put('/updateContact/:empid', (req, res) => {
    const empid = req.params.empid;
    const { empname, phoneno, city, pincode, street, picture } = req.body;
  
    // Validate input data
    if (!empname || !phoneno || !city || !pincode || !street || !picture) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    // Begin a transaction
    connection.beginTransaction((err) => {
      if (err) {
        console.error('Error beginning transaction:', err);
        return res.status(500).json({ error: 'Error beginning transaction' });
      }
  
      // Update employee table
      const updateEmployeeQuery = 'UPDATE employee SET empname = ?, phoneno = ? WHERE empid = ?';
      connection.query(updateEmployeeQuery, [empname, phoneno, empid], (err, result) => {
        if (err) {
          connection.rollback(() => {
            console.error('Error updating record in employee table:', err);
            return res.status(500).json({ error: 'Error updating record in employee table' });
          });
        }
  
        // Update address table
        const updateAddressQuery = 'UPDATE address SET city = ?, pincode = ?, street = ? WHERE empid = ?';
        connection.query(updateAddressQuery, [city, pincode, street, empid], (err, result) => {
          if (err) {
            connection.rollback(() => {
              console.error('Error updating record in address table:', err);
              return res.status(500).json({ error: 'Error updating record in address table' });
            });
          }
  
          // Update profilepicture table
          const updateProfilePictureQuery = 'UPDATE profilepicture SET picture = ? WHERE empid = ?';
          connection.query(updateProfilePictureQuery, [picture, empid], (err, result) => {
            if (err) {
              connection.rollback(() => {
                console.error('Error updating record in profilepicture table:', err);
                return res.status(500).json({ error: 'Error updating record in profilepicture table' });
              });
            }
  
            // Commit the transaction
            connection.commit((err) => {
              if (err) {
                connection.rollback(() => {
                  console.error('Error committing transaction:', err);
                  return res.status(500).json({ error: 'Error committing transaction' });
                });
              }
              console.log('Transaction committed successfully');
              res.status(200).json({ message: 'Contact updated successfully' });
            });
          });
        });
      });
    });
  });

  //search employee by name or phoneno
  
app.get('/searchContact/:searchValue', (req, res) => {
  const searchTerm = req.params.searchValue;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Search query parameter "q" is required' });
  }

  const searchQuery = '%' + searchTerm + '%';

  const sql = `
    SELECT 
      e.empid,
      e.empname,
      e.phoneno,
      a.city,
      a.pincode,
      a.street,
      pp.picture
    FROM 
      employee e
    LEFT JOIN 
      address a ON e.empid = a.empid
    LEFT JOIN 
      profilepicture pp ON a.empid = pp.empid
    WHERE 
      e.empname LIKE ? OR e.phoneno LIKE ?
  `;

  connection.query(sql, [searchQuery, searchQuery], (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ error: 'Error executing SQL query' });
    }else if(results == 0 || results == null){
      return res.status(500).json({ error: 'No Record Found' });
    }
    res.json(results);
  });
});

  
     


app.listen(3000,()=>console.log('Express server is running on port 3000'))