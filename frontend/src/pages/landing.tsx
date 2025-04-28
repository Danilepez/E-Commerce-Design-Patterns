/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
import {
  Card,
  CardFooter,
  Image,
  CardBody,
  Skeleton,
  Button,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

import DefaultLayout from "@/layouts/default";
import { Product } from "@/interface/product";
import ChatBot from "@/components/chatBot";

const recyclers = [
  {
    title: "Bienvenido a DanielLopezLTDA.\nTu tienda virtual de confianza.",
    desc: "Explora nuestro amplio catálogo de productos, contamos con productos tan únicos como interesantes.\nDesde Bandas elásticas, hasta calcetines de Pollos Copacabana.",
    buttonDesc: "Comienza a explorar",
  },
  {
    title: "Explora en nuestras diversas categorías!",
    desc: "Contamos con una gran variedad de categorías y productos.\nPeluches, coleccionables, merchandicing...\nLo tenemos todo 🐢✨",
    buttonDesc: "Explorar categorías",
  },
  {
    title: "No tan increíbles descuentos, pero si muy reales.\nPor lo general.",
    desc: "Contamos con descuentos especiales para productos seleccionados\nNo te pierdas ninguna de las ofertas recientes y usa ese dinero ahorrado en un poco de gasolina 💀",
    buttonDesc: "Plata!!",
  },
];

const LandingPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleDetails = (product: Product) => {
    setTimeout(() => {
      navigation(`/product/${product.id}`);
    }, 300);
  };

  useEffect(() => {
    axios
      .get("http://localhost:3000/products")
      .then((response) => {
        const productsData: Product[] = (response.data as Product[]).map(
          (prod: any) => ({
            ...prod,
            id: prod._id,
          }),
        );

        setProducts(productsData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);

  const [fade, setFade] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true); // Inicia la animación
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % recyclers.length);
        setFade(false);
      }, 500); // Tiempo anim
    }, 6000); // Cambio en 6 s

    return () => clearInterval(interval);
  }, []);

  const handleButtonClick = () => {
    switch (currentIndex) {
      case 0:
        navigation(`/`);
        break;
      case 1:
        navigation(`/category`);
        break;
      case 2:
        navigation("/offers");
        break;
    }
  };

  return (
    <DefaultLayout>
      <div className="bg-white-800 dark:bg-neutral-900 max-w-7xl mx-auto">
        <div
          className={`transition-opacity duration-500 ${fade ? "opacity-0" : "opacity-100"}`}
        >
          <div className="flex justify-between items-start rounded-lg p-12 shadow-md mx-auto m-10">
            {/* Sección a la izquierda */}
            <div className="flex flex-col w-1/2">
              {" "}
              {/* Cambiado a w-1/2 */}
              <h1
                className="text-6xl font-bold text-gray-800 dark:text-gray-200"
                style={{ whiteSpace: "pre-line" }}
              >
                {recyclers[currentIndex].title}
              </h1>
            </div>

            {/* Sección por la derecha */}
            <div className="flex-grow text-right  m-6 w-1/2">
              <h2
                className="text-lg font-semibold text-gray-700 dark:text-gray-200"
                style={{ whiteSpace: "pre-line" }}
              >
                {recyclers[currentIndex].desc}
              </h2>
              <Button
                className="my-8 px-8 py-4 text-lg"
                color="primary"
                onPress={handleButtonClick}
              >
                {recyclers[currentIndex].buttonDesc}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <h1
        className="text-3xl font-bold text-gray-800 dark:text-gray-200 m-10"
        style={{ whiteSpace: "pre-line" }}
      >
        Explora nuestros productos:
      </h1>

      <div className="flex gap-4 flex-wrap items-center justify-center">
        {products.map((item) => (
          <Skeleton key={item.id} className="rounded-lg" isLoaded={!loading}>
            <Card
              isPressable
              className="size-80 p-2 h-auto"
              shadow="sm"
              onPress={() => handleDetails(item)}
            >
              <CardBody className="overflow-visible p-0">
                <Image
                  alt={item.nombre}
                  className="w-full object-fill h-[270px]"
                  radius="lg"
                  shadow="sm"
                  src={item.imagen}
                  width={384}
                />
              </CardBody>
              <CardFooter className="text-base justify-between">
                <b>{item.nombre}</b>
                <p className="text-default-500 text-lg">Bs.{item.precio}</p>
              </CardFooter>
            </Card>
          </Skeleton>
        ))}
      </div>
    </DefaultLayout>
  );
};

export default LandingPage;
