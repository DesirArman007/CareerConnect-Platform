export function normalizeJSON(schema) {
  schema.set("toJSON", {
    transform(_, ret) {
      if (ret._id) {
        ret.id = ret._id.toString();
        delete ret._id;
      }

      delete ret.__v;
      return ret;
    }
  });
}
