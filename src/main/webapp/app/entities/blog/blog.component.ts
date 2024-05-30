import { defineComponent, inject, onMounted, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import BlogService from './blog.service';
import { type IBlog } from '@/shared/model/blog.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Blog',
  setup() {
    const { t: t$ } = useI18n();
    const blogService = inject('blogService', () => new BlogService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const currentSearch = ref('');

    const blogs: Ref<IBlog[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {
      currentSearch.value = '';
    };

    const retrieveBlogs = async () => {
      isFetching.value = true;
      try {
        const res = currentSearch.value ? await blogService().search(currentSearch.value) : await blogService().retrieve();
        blogs.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveBlogs();
    };

    onMounted(async () => {
      await retrieveBlogs();
    });

    const search = query => {
      if (!query) {
        return clear();
      }
      currentSearch.value = query;
      retrieveBlogs();
    };

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IBlog) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeBlog = async () => {
      try {
        await blogService().delete(removeId.value);
        const message = t$('blogApp.blog.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveBlogs();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      blogs,
      handleSyncList,
      isFetching,
      retrieveBlogs,
      clear,
      currentSearch,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeBlog,
      t$,
    };
  },
});
