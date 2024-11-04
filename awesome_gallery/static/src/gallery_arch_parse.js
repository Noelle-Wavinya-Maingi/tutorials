export class GalleryArchParser {
    parse(xmlDoc) {
      const imageField = xmlDoc.getAttribute("image_field");
      const tooltipField = xmlDoc.getAttribute("tooltip_field");
      const limit = xmlDoc.getAttribute("limit") || 80;
  
      console.log("Parsed XML:", { imageField, tooltipField, limit }); 
  
      return {
        imageField,
        limit,
        tooltipField,
      };
    }
  }
  