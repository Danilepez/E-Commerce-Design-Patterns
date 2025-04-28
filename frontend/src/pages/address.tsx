/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Checkbox,
  Button,
  Select,
  SelectItem,
} from "@heroui/react";
import { useNavigate } from "react-router";

import DefaultLayout from "@/layouts/default";

const AddressPage = () => {
  const navigate = useNavigate();

  const [countries, setCountries] = useState<
    { cca3: string; name: { common: string } }[]
  >([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [, setSubmitted] = useState<{
    [k: string]: FormDataEntryValue;
  } | null>(null);
  const [rememberAddress, setRememberAddress] = useState(false);

  // Cargar países desde la API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();

        const sortedCountries = data.sort(
          (
            a: { name: { common: string } },
            b: { name: { common: string } },
          ) => {
            const nameA = a.name.common.toLowerCase();
            const nameB = b.name.common.toLowerCase();

            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;

            return 0;
          },
        );

        const filteredCountries = JSON.parse(
          JSON.stringify(sortedCountries),
        )

        setCountries(filteredCountries);
      } catch (error) {
        alert("Error al obtener países: " + (error as any).message);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem("addressData");

    if (savedData) {
      navigate("/verify-purchase");
    }
  }, [navigate]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));

    if (rememberAddress) {
      localStorage.setItem("addressData", JSON.stringify(data));
    }

    setSubmitted(data);

    navigate("/verify-purchase");
  };

  return (
    <DefaultLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Dirección
        </h1>
        <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-6">
          Dirección de entrega
        </h2>
        <Form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onReset={() => setSubmitted(null)}
          onSubmit={onSubmit}
        >
          <Input
            isRequired
            errorMessage="Por favor ingresa tu nombre y apellido correctamente"
            label="Nombre y Apellido"
            labelPlacement="outside"
            name="name"
            placeholder="Ingresa tu nombre y apellido"
            type="text"
          />
          <Input
            isRequired
            errorMessage="Por favor ingresa un número válido"
            label="Número de Teléfono"
            labelPlacement="outside"
            name="phone"
            placeholder="Ingresa tu número"
            type="number"
          />
          <Input
            isRequired
            errorMessage="Por favor ingresa un correo válido"
            label="Correo Electrónico"
            labelPlacement="outside"
            name="email"
            placeholder="Ingresa tu correo"
            type="email"
          />
          <Select
            isRequired
            label="País"
            labelPlacement="outside"
            name="country"
            placeholder="Selecciona tu país"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            {countries.map((country) => (
              <SelectItem key={country.cca3}>{country.name.common}</SelectItem>
            ))}
          </Select>
          <Input
            isRequired
            errorMessage="Por favor ingresa tu dirección"
            label="Línea de Dirección 1"
            labelPlacement="outside"
            name="address1"
            placeholder="Nombre de la calle"
            type="text"
          />
          <Input
            label="Línea de Dirección 2"
            labelPlacement="outside"
            name="address2"
            placeholder="Depto, unidad, edificio, piso, etc."
            type="text"
          />
          <Input
            isRequired
            errorMessage="Por favor ingresa tu ciudad"
            label="Ciudad"
            labelPlacement="outside"
            name="city"
            placeholder="Ingresa tu ciudad"
            type="text"
          />
          <Input
            isRequired
            errorMessage="Por favor ingresa tu código postal"
            label="Código Postal"
            labelPlacement="outside"
            name="postal"
            placeholder="Ingresa tu código postal"
            type="number"
          />
          <div className="flex items-center mt-2">
          <Checkbox
            classNames={{ label: "text-small" }}
            name="remember"
            validationBehavior="aria"
            value="true"
            onValueChange={(checked) => {
                setRememberAddress(checked); }}
            >
            ¿Recordar dirección?
          </Checkbox>
          </div>

          <div className="col-span-2 flex justify-end gap-4">
            <Button color="secondary" size="lg" type="reset" variant="bordered">
              Resetear
            </Button>
            <Button color="primary" size="lg" type="submit">
              Siguiente
            </Button>
          </div>
        </Form>
      </div>
    </DefaultLayout>
  );
};

export default AddressPage;
