import { KeepLast } from "@web/core/utils/concurrency";

export class GalleryModel {
  constructor(orm, resModel, fields, archInfo) {
    this.orm = orm;
    this.resModel = resModel;
    const { imageField, limit, tooltipField } = archInfo;
    this.imageField = imageField || "image_1920";
    this.fields = fields;
    this.limit = limit;
    this.tooltipField = tooltipField || "name";
    this.keepLast = new KeepLast();
    this.records = [];
    this.isLoading = false;
    this.pager = { offset: 0, limit: limit };
  }

  async load(domain) {
    try {
      this.isLoading = true;
      const { length,records } = await this.keepLast.add(
        this.orm.webSearchRead(this.resModel, domain, {
          limit: this.pager.limit,
          offset: this.pager.offset,
          specification: {
            [this.imageField]: {},
            ...(this.tooltipField ? { [this.tooltipField]: {} } : {}),
            write_date: {}
          },
          context: {
            bin_size: true,
          },
        })
      );

      this.recordsLength = length;
      this.records = records;

      if (!Array.isArray(records)) {
        console.error("Received invalid records format:", records);
        this.records = [];
        return;
      }

      if (this.tooltipField && this.fields[this.tooltipField]) {
        this.records = records.map((record) => {
          const processed = { ...record };
          switch (this.fields[this.tooltipField].type) {
            case "many2one":
              this.records = records.map((record) => ({
                ...record,
                [this.tooltipField]: record[this.tooltipField][1],
              }));
              break;
            case "integer":
              this.records = records.map((record) => ({
                ...record,
                [this.tooltipField]: String(record[this.tooltipField]),
              }));
              break;
            default:
              break;
          }
          return processed;
        });
      } else {
        this.records = records;
      }

      console.log("Processed records: ", this.records);
    } catch (e) {
      console.error("Error loading records:", e);
      this.records = [];
      throw e;
    } finally {
      this.isLoading = false;
    }
  }

  async uploadImage(record_id, image_binary, domain) {
    await this.orm.webSave(
      this.resModel,
      [record_id],
      {
        [this.imageField]: image_binary
      },
      {
        specification: {},
      }
    )
    await this.load(domain);
  }
}
