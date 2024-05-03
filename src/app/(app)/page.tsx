'use client'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import messages from "@/messages.json";

const Home = () => {
  return (
    
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12">
        <section className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold">Unleash your thoughts in anonymity.</h1>
          <p className="mt-3 md:mt-4 text-base md:text-lg">
          Embark on anonymous adventures where secrets find their voice.  
          </p>
        </section>
        <div>
          <Carousel
            plugins={[Autoplay({delay: 2000})]}
            opts={{
              loop: true
            }}
          className="w-full max-w-xs">
          <CarouselContent>
            {
              messages.map((message, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-6">
                        <span className="text-lg text-pretty h-auto font-semibold">{message.content}</span>
                      </CardContent>
                      <CardFooter>
                        {
                          message.received
                        }
                      </CardFooter>
                    </Card>
                  </div>
                </CarouselItem>
              ))
            }
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious />
          </div>
          <div className="hidden md:block">
            <CarouselNext />
          </div>

        </Carousel>

        </div>
      </main>
  );
}

export default Home;
