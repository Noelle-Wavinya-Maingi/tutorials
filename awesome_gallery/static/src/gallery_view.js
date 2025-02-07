import { registry } from "@web/core/registry";
import { GalleryController } from "./gallery_controller";
import { GalleryArchParser } from "./gallery_arch_parse";
import { GalleryModel } from "./gallery_model";
import { GalleryRenderer } from "./gallery_renderer";

console.log("Getting my gallery view....");


export const galleryView = {
    type: "gallery",
    display_name: "Gallery",
    icon: "fa fa-picture-o",
    multiRecord: true,
    Controller: GalleryController,
    ArchParser: GalleryArchParser,
    Model: GalleryModel,
    Renderer: GalleryRenderer,

    props(genericProps, view) {
        const { ArchParser } = view;
        const { arch } = genericProps;
        const archInfo = new ArchParser().parse(arch);

        return {
            ...genericProps,
            Model: view.Model,
            Renderer: view.Renderer,
            archInfo,
        };
    },
};

registry.category("views").add("gallery", galleryView);

console.log("Gallery view registered:", registry.category("views").get("gallery"));
