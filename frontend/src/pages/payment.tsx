/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Button,
  Skeleton,
  Image,
  Alert,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import axios from "axios";
import { useNavigate } from "react-router";
import DefaultLayout from "@/layouts/default";
import { useBuyNow } from "@/context/buyNowContext";
import { useCart } from "@/context/cartContext";
import { Product } from "@/interface/product";
import { PurchaseProduct } from "@/interface/purchaseProduct";
import PaypaylIcon from "@/icons/paypaylIcon";
import CardIcon from "@/icons/cardIcon";
import CryptoIcon from "@/icons/cryptoIcon";
import { title } from "@/components/primitives";
import CryptoBody from "@/components/payments/cryptoBody";
import PaypalBody from "@/components/payments/paypalBody";
import CardpayBody from "@/components/payments/cardpayBody";

const VerifyPurchasePage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const { buyNow } = useBuyNow();
  const { products: cartProducts } = useCart();
  const [products, setProducts] = useState<PurchaseProduct[]>([]);
  const addressData = JSON.parse(localStorage.getItem("addressData") || "{}");
  const [showCheck, setShowCheck] = useState(false);
  const [method, seteMethod] = useState("card");
  const [, setResponse] = useState<any>(null);
  const {isOpen, onOpen, onClose} = useDisclosure();

  const handleOpen = (m: string) => {
    seteMethod(m);
    onOpen();
  };


  useEffect(() => {

    const fetchProducts = async () => {
      try {
        if (buyNow) {
          const response = await axios.get<Product & { _id: string }>(
            `http://localhost:3000/products/${buyNow.id}`
          );
          const productData = response.data;
          const product: PurchaseProduct = {
            id: productData._id,
            name: productData.nombre,
            description: productData.descripcion,
            price: productData.precio,
            imagen: productData.imagen,
            stock: productData.stock,
            quantity: 1,
          };

          setProducts([product]);
        } else if (cartProducts && cartProducts.length > 0) {
          const fetchedProducts = await Promise.all(
            cartProducts.map(async (cartProduct) => {
              const response = await axios.get<Product & { _id: string }>(
                `http://localhost:3000/products/${cartProduct.id}`
              );
              const productData = response.data;
              const product: PurchaseProduct = {
                id: productData._id,
                name: productData.nombre,
                description: productData.descripcion,
                price: productData.precio,
                imagen: productData.imagen,
                stock: productData.stock,
                quantity: cartProduct.cantidad,
              };

              return product;
            })
          );

          setProducts(fetchedProducts);
        }
      } catch {
        throw new Error("Error al obtener los productos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const subtotal = products.reduce(
    (acc, product) => acc + product.price * product.quantity,
    0
  );
  const taxes = (subtotal * 0.15).toFixed(2);
  const total = (subtotal + parseFloat(taxes)).toFixed(2);

  const handlePayment = () => {
    setLoading(true);
    setShowCheck(false);
    setTimeout(() => {
      setLoading(false);
      setShowCheck(true);
      handleSubmit();
    }, 5000);
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post('http://localhost:3000/payments', {
        method,
        amount: total,
        currency: "Bs",
      });
      setResponse(res.data);
      console.log("handleSubmit ejecutado")
      setTimeout(() => {
        localStorage.removeItem("cart")
        navigate("/package")
      }, 2500);
    } catch (error) {
      console.error('Error al procesar el pago:', error);
    }
  };


  return (
    <DefaultLayout>
      <h3 className={title()}>Método de Pago</h3>
      <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6 ">
        <div className="bg-gray-100 p-4 rounded shadow max-w-2xl mx-auto dark:bg-neutral-900">
          <Alert className="mb-5" color="danger" variant="solid">
            Estamos procesando tu pago, por favor no cierres esta página.
          </Alert>
          <h2 className="text-2xl font-bold mb-4 dark:bg-neutral-900">Verificar Pedido</h2>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className={`border p-4 rounded-lg shadow-md transition-colors duration-300 border-gray-800`}
                >
                  <div className="flex justify-end">
                    <Button size="sm" onPress={() => navigate(`/product/${product.id}`)}>
                      Revisar pedido
                    </Button>
                  </div>
                  <div className="mt-4 flex">
                    <Image
                      alt={product.name}
                      className="w-36 h-36 object-cover rounded"
                      src={product.imagen}
                    />
                    <div className="ml-6 flex flex-col space-y-1">
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <p className="text-gray-600">{product.description}</p>
                      <p className="text-gray-600">Cantidad: {product.quantity}</p>
                      <p className="text-gray-600">Precio Unitario: Bs.{product.price}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="md:w-1/2">
          <Skeleton className="rounded-lg" isLoaded={!loading} >
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold">Dirección de Envío</h2>
              </CardHeader>
              <CardBody>
                {localStorage.getItem("addressData") ? (
                  <div className="mb-4">
                    <p>{addressData.name}</p>
                    <p>{addressData.address1}</p>
                    {addressData.address2 && <p>{addressData.address2}</p>}
                    <p>
                      {addressData.city}, {addressData.zip}
                    </p>
                    <p>{addressData.country}</p>
                    <p>{addressData.phone}</p>
                    <p>{addressData.email}</p>
                  </div>
                ) : (
                  <p>No se ha proporcionado la dirección</p>
                )}
                <Divider className="my-4" />
                <h3 className="text-lg font-bold mb-2">Resumen del Pedido</h3>
                <p>
                  <strong>Número de productos:</strong> {products.length}
                </p>
                <p>
                  <strong>Subtotal:</strong> Bs.{subtotal.toFixed(2)}
                </p>
                <p>
                  <strong>Impuestos (15%):</strong> Bs.{taxes}
                </p>
                <p>
                  <strong>Total:</strong> Bs.{total}
                </p>
              </CardBody>

              <CardFooter className="flex flex-col items-center gap-5">
                <Button isIconOnly className="w-full py-5 h-14 rounded-md" color="warning" onPress={() => handleOpen("paypal")}>
                  <PaypaylIcon />
                </Button>
                <Button className="text-xl font-bold text-white bg-black w-full h-14 rounded-md" color="success" onPress={() => handleOpen("card")}>
                  <CardIcon /> Tarjeta de Crédito
                </Button>
                <Button className="text-xl font-bold text-white w-full h-14 rounded-md" color="primary" onPress={() => handleOpen("crypto")}>
                  <CryptoIcon /> Criptomonedas
                </Button>
              </CardFooter>
            </Card>
          </Skeleton>
        </div>
      </div>

      <Modal isOpen={isOpen} size={"5xl"} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Información de Pago</ModalHeader>
            <ModalBody>
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <Spinner size="lg" color="primary" />
                </div>
              ) : showCheck ? (
                <div className="flex justify-center items-center h-full">
                  <img src="https://www.svgrepo.com/show/92787/check-mark.svg" alt="Check" className="h-20 w-20" />
                  <p> Transacción completada con éxito.</p>
                </div>
              ) : method === "paypal" ? (
                <PaypalBody />
              ) : method === "card" ? (
                <CardpayBody />
              ) : method === "crypto" ? (
                <CryptoBody />
              ) : null}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button color="primary" onPress={handlePayment}>
                Pagar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
    </DefaultLayout>

  );
};

export default VerifyPurchasePage;
