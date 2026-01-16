pipeline {
    agent any
    
    environment {
        REGISTRY = "registry.lunacities.ru:5000"
        IMAGE_NAME = "sof_api"
        IMAGE_TAG = "latest"
    }
    
    stages {
        stage('Clone repo') {
            steps {
                git branch: 'main', url: 'https://github.com/the1001night/studious-octo-fishstick'
            }
        }

        stage('Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Tests') {
            steps {
                sh 'npm test -- unit.test.js'
            }
        }

        stage('Build') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Login to Registry') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-registry', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                    sh 'echo $PASSWORD | docker login ${REGISTRY} -u $USERNAME --password-stdin'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }
    }

    post {
        success {
            echo "Docker image ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} успешно запушен!"
        }
        failure {
            echo "Что-то пошло не так при сборке или пуше Docker-образа."
        }
    }
}
