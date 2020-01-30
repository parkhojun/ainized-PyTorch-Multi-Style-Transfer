FROM pytorch/pytorch

CMD ["bash"]

WORKDIR /workspace
RUN apt-get update
RUN apt-get -y install vim
RUN curl -sL https://deb.nodesource.com/setup_11.x  | bash -
RUN apt-get -y install nodejs
RUN pip install --upgrade pip
RUN pip install opencv-python==3.4.8.29
RUN apt-get install -y libglib2.0-0
RUN apt-get install -y libglib2.0-0:i386
RUN apt-get install -y libsm6 libxext6 libxrender-dev
RUN git clone https://github.com/parkhojun/ainized-PyTorch-Multi-Style-Transfer.git
WORKDIR /workspace/ainized-PyTorch-Multi-Style-Transfer/experiments
RUN bash models/download_model.sh


RUN rm -rf node_modules && npm install

COPY package.json .
RUN npm install
RUN npm install sync-exec

COPY . .
EXPOSE 80
ENTRYPOINT npm start

