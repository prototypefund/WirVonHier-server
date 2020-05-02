FROM mongo

COPY ./*.json ./
COPY ./mongo-import.sh .
CMD ["bin/bash", "mongo-import.sh"]
