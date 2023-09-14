import {visit} from 'unist-util-visit'
import path from "path";

export default function transform({ dir }) {
  return (tree, file) => {
    visit(tree, 'paragraph', node => {
      const image = node.children.find(child => child.type === 'image')

      if (image) {
        image.url = path.join('/catalog', dir, image.url)
      }
    })
  }
}
