/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ChatBotService {
  private genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
  private model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  private promptTexto = `ROBOT ASISTENTE DE CATEGORIZACIÓN - VERSIÓN 4.0

  🛑 FUNCIONAMIENTO AUTOMÁTICO: Analizar mensajes y asignar EXCLUSIVAMENTE categorías de esta lista:
  
  1. tecnologia → (computadora, laptop, tablet, macbook, surface, ipad)
  2. peluches → (peluche, osito, muñeco felpa, stuffed animal)
  3. accesorios → (aretes, anillos, collares, gafas sol, joyería)
  4. libros → (novela, cómic, manga, libro texto, ebook)
  5. deporte → (balón, raqueta, pesas, bicicleta, equipo gym)
  6. tazas → (taza personalizada, mug, vaso térmico, termo)
  7. ropa → (vestido, camiseta, jeans, pantalón, chaqueta)
  8. salud → (perfume, vitaminas, suplementos, cuidado personal)
  9. electronica → (cámara, televisor, auriculares, celular)
  10. hogar → (decoración, electrodomésticos, menaje, vajilla)
  11. juguetes → (muñecas, carros juguete, figuras acción)
  12. decoracion → (sofá, cojines, cuadros, cortinas)
  13. juegosmesa → (ajedrez, cartas, rompecabezas, catán)
  14. moda → (reloj, zapatos, bolso, cinturón, sombrero)
  15. cocina → (cuchillos, ollas, sartenes, utensilios)
  16. coleccionables → (figuras colección, posters, funko pop)
  17. herramientas → (destornillador, taladro, martillo)
  18. instrumentos → (guitarra, piano, batería, violín)
  19. musica → (cd, vinilo, tickets concierto, merchandising)
  20. electrodomesticos → (horno, licuadora, microondas)
  21. videojuegos → (playstation, nintendo, xbox, pc gaming)
  22. merchandising → (camiseta anime, figuras películas)
  23. entretenimiento → (películas, series, plataformas digitales)
  24. calzadodeportivo → (zapatos deportivos, sneakers)
  25. ropadeportiva → (mallas, shorts, leggings, sudaderas)
  26. bebidas → (refrescos, agua, jugos, energéticas, alcohol, café, té)
  
  🔥 PROTOCOLO DE ACCIÓN:
  1. ESCANEAR cada palabra del mensaje
  2. BUSCAR coincidencia EXACTA en nombres o sinónimos
  3. ASIGNAR primera categoría con match
  4. SI múltiples matches → Priorizar en este orden:
     a) Términos técnicos
     b) Específicos sobre genéricos
     c) Marcas conocidas
  
  ⚠️ RESPUESTAS PERMITIDAS:
  - SOLO el nombre de la categoría en minúsculas
  - NADA de explicaciones adicionales
  - SIN formato especial
  
  ✅ EJEMPLOS:
  Input: "Quiero una Coca-Cola y un jugo de naranja"
  Output: "bebidas"
  
  Input: "Busco café gourmet y tazas temáticas"
  Output: "bebidas&tazas"
  
  ANÁLISIS REQUERIDO PARA:`;

  async extractCategory(message: string): Promise<string | null> {
    try {
      const fullPrompt = `${this.promptTexto} "${message}"`;
      const result = await this.model.generateContent(fullPrompt);
      const rawResponse = result.response.text().trim().toLowerCase();
      
      const cleanResponse = rawResponse.replace(/["'.]/g, '');
      
      const categoryMap: { [key: string]: string | null } = {
        'tecnología': 'tecnologia',
        'bebida': 'bebidas',
        'jugo': 'bebidas',
        'refresco': 'bebidas',
        'licor': 'bebidas',
        'electrónica': 'electronica',
        'decoración': 'decoracion',
        'none': null
      };

      const categories = cleanResponse.split('&')
        .map(c => categoryMap[c] || c)
        .filter(c => this.validCategories.includes(c));

      return categories.length > 0 ? categories.join('&') : null;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  private validCategories = [
    'tecnologia', 'peluches', 'accesorios', 'libros', 'deporte',
    'tazas', 'ropa', 'salud', 'electronica', 'hogar', 'juguetes',
    'decoracion', 'juegosmesa', 'moda', 'cocina', 'coleccionables',
    'herramientas', 'instrumentos', 'musica', 'electrodomesticos',
    'videojuegos', 'merchandising', 'entretenimiento', 'calzadodeportivo',
    'ropadeportiva', 'bebidas'
  ];

  async getAIResponse(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      const conversation = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      const result = await this.model.generateContent(`Continúa esta conversación como asistente de e-commerce:\n${conversation}`);
      return result.response.text();
    } catch (error) {
      console.error('Error:', error);
      throw new InternalServerErrorException('Error al generar respuesta');
    }
  }
}