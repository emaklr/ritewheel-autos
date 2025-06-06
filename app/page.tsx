'use client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function HomePage() {
  const [cars] = useState([
    {
      id: 1,
      name: "2021 Mercedes-Benz GLE 63S",
      brand: "Mercedes-Benz",
      year: 2021,
      price: "$110,000",
      image: "/car1.jpg",
    },
    {
      id: 2,
      name: "2020 BMW X6 M",
      brand: "BMW",
      year: 2020,
      price: "$95,000",
      image: "/car2.jpg",
    },
    {
      id: 3,
      name: "2022 Range Rover Sport",
      brand: "Land Rover",
      year: 2022,
      price: "$120,000",
      image: "/car3.jpg",
    },
  ]);

  return (
    <div className="bg-black min-h-screen text-white p-6">
      <header className="text-center py-10">
        <h1 className="text-4xl font-bold text-yellow-400">RiteWheel Autos</h1>
        <p className="text-lg mt-2">Luxury Cars | Open 24/7 | Built by Babatunde Seun</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cars.map((car) => (
          <Card key={car.id} className="bg-white text-black rounded-2xl overflow-hidden">
            <img src={car.image} alt={car.name} className="w-full h-48 object-cover" />
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold">{car.name}</h2>
              <p className="text-sm text-gray-600">Brand: {car.brand} | Year: {car.year}</p>
              <p className="text-lg font-bold mt-2">{car.price}</p>
              <Button
                className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500"
                onClick={() => window.open("https://wa.me/2347012345678?text=I'm%20interested%20in%20a%20car%20on%20RiteWheel%20Autos", "_blank")}
              >
                Book a Call on WhatsApp
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <footer className="text-center mt-16 border-t border-yellow-400 pt-6">
        <p className="text-sm text-yellow-400">© 2025 RiteWheel Autos — Built for Performance | Developed by Babatunde Seun</p>
      </footer>
    </div>
  );
}