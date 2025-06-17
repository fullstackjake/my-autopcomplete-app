import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import type { User } from "./interfaces/UserInterface";

// A Suffix (like Jr., Sr., II) indicates a generation or distinction
// Honorifics or Title of Position indicate social status, professional position, or marital status

// Small list of honorifics to parse names
const formatUserLabel = (user: User): string => {
  const honorifics = new Set([
    "Mr.",
    "Mrs.",
    "Ms.",
    "Miss",
    "Dr.",
    "Dr",
    "Prof.",
    "Professor",
    "Sir",
    "Madam",
    "Mx.",
  ]);

  // Names are one string. Data Injested could have just a "Name" field.
  const nameParts = user.name.trim().split(/\s+/);
  let firstName = nameParts[0];
  let lastName = nameParts[nameParts.length - 1];

  // No need to use honorifics as a name (Will be displayed at the end)
  if (honorifics.has(firstName)) {
    firstName = "";
  }

  if (honorifics.has(lastName)) {
    lastName = "";
  }

  const suffixPart = user.suffix ? ` ${user.suffix}` : "";
  const titlePart = user.title ? ` (${user.title})` : "";
  //Check If names exist and are valid
  const hasValidName = firstName || lastName;
  const hasOneName = firstName && lastName ? "," : "";

  if (hasValidName) {
    return `${lastName}${suffixPart}${hasOneName} ${firstName}${titlePart}`
      .replace(/,\s+$/, ",")
      .trim();
  } else {
    return `Unknown Name${titlePart}`;
  }
};

const DropDownList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((res) => res.json())
      .then((data: User[]) => {
        // Inject fake data for demo purposes
        const usersWithExtras = data.map((user, index) => ({
          ...user,
          suffix: index % 2 === 0 ? "Jr." : undefined,
          title: index % 3 === 0 ? "Mr." : index % 5 === 0 ? "Mrs." : undefined,
        }));

        const sorted = usersWithExtras.sort((a, b) => {
          const lastA = a.name.split(" ").slice(-1)[0];
          const lastB = b.name.split(" ").slice(-1)[0];
          return lastA.localeCompare(lastB);
        });

        setUsers(sorted);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch users:", error);
        setLoading(true);
      });
  }, []);

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
      <Autocomplete
        options={users}
        getOptionLabel={(option) => formatUserLabel(option)}
        loading={loading}
        onChange={(_, value) => setSelectedUser(value)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Name"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        isOptionEqualToValue={(option, value) => option.id === value.id}
      />

      {selectedUser && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Address</Typography>
          <Typography>
            {selectedUser.address.street}, {selectedUser.address.suite}
          </Typography>
          <Typography>
            {selectedUser.address.city}, {selectedUser.address.zipcode}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DropDownList;
