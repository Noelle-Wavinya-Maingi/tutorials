import { Layout } from "@web/search/layout";
import { Component, onWillStart, onWillUpdateProps, useState } from "@odoo/owl";
import { standardViewProps } from "@web/views/standard_view_props";
import { useService } from "@web/core/utils/hooks";
import { usePager } from "@web/search/pager_hook";

export class GalleryController extends Component {
  static template = "awesome_gallery.GalleryController";
  static props = {
    ...standardViewProps,
    archInfo: Object,
    Model: Function,
    Renderer: Function,
  };
  static components = { Layout };

  setup() {
    this.orm = useService("orm");

    this.model = useState(
      new this.props.Model(
        this.orm,
        this.props.resModel,
        this.props.archInfo,
        this.props.fields
      )
    );

    usePager(() => {
      const pager = this.model.pager;
    
      return {
        offset: pager.offset ?? 0,
        limit: pager.limit ?? 20,
        total: this.model.recordsLength,

        onUpdate: async ({ offset = 0, limit = 20 }) => {
          pager.offset = offset ;
          pager.limit = limit;

          try{
          await this.model.load(this.props.domain);
          } catch (e) {
            console.error("Error in pagination update:", e);
          }
        },
      };
    });

    onWillStart(async () => {
      try {
        await this.model.load(this.props.domain);
      } catch (e) {
        console.error("Error in onWillStart: ", e);
        
      }
    });

    onWillUpdateProps(async (nextProps) => {
      try {
      if (JSON.stringify(nextProps.domain) !== JSON.stringify(this.props.domain)) {
        await this.model.load(nextProps.domain);
      }
    } catch (e) {
      console.error("Error in onWillUpdateProps:", e);
      
    }
    });
  }

  async onImageUpload(record_id, image_binary) {
    this.model.uploadImage(record_id, image_binary, this.props.domain);
  }
}
